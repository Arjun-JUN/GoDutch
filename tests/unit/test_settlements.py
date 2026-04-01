"""
Unit tests for the settlement calculation algorithm.

The algorithm lives inside the async route handler `get_settlements` in
backend/server.py.  To make it independently testable without spinning up
HTTP or a database, we reproduce the same logic here as a standalone function
`calculate_settlements` and verify its correctness against known scenarios.
"""
import pytest


def calculate_settlements(group: dict, expenses: list) -> list:
    """
    Standalone mirror of the settlement logic in server.get_settlements.
    Returns a list of dicts: {from_user_id, from_user_name, to_user_id,
                               to_user_name, amount}.
    """
    balances: dict = {}
    for member in group["members"]:
        balances[member["id"]] = {"name": member["name"], "balance": 0.0}

    for expense in expenses:
        paid_by = expense["created_by"]
        for split in expense["split_details"]:
            if split["user_id"] != paid_by:
                balances[split["user_id"]]["balance"] -= split["amount"]
                balances[paid_by]["balance"] += split["amount"]

    settlements = []
    debtors = [(uid, d) for uid, d in balances.items() if d["balance"] < -0.01]
    creditors = [(uid, d) for uid, d in balances.items() if d["balance"] > 0.01]

    for debtor_id, debtor_data in debtors:
        for creditor_id, creditor_data in creditors:
            if abs(debtor_data["balance"]) < 0.01 or creditor_data["balance"] < 0.01:
                continue
            amount = min(abs(debtor_data["balance"]), creditor_data["balance"])
            settlements.append(
                {
                    "from_user_id": debtor_id,
                    "from_user_name": debtor_data["name"],
                    "to_user_id": creditor_id,
                    "to_user_name": creditor_data["name"],
                    "amount": round(amount, 2),
                }
            )
            debtor_data["balance"] += amount
            creditor_data["balance"] -= amount

    return settlements


# ── helpers ───────────────────────────────────────────────────────────────────

def _group(members):
    return {"members": members}


def _expense(created_by, split_details):
    return {"created_by": created_by, "split_details": split_details}


def _split(user_id, amount):
    return {"user_id": user_id, "amount": amount}


# ── tests ─────────────────────────────────────────────────────────────────────

class TestCalculateSettlements:

    def test_no_expenses_produces_no_settlements(self):
        group = _group([{"id": "u1", "name": "Alice"}, {"id": "u2", "name": "Bob"}])
        assert calculate_settlements(group, []) == []

    def test_two_people_one_expense_equal_split(self):
        """Alice paid $60, split equally.  Bob owes Alice $30."""
        group = _group([{"id": "u1", "name": "Alice"}, {"id": "u2", "name": "Bob"}])
        expense = _expense(
            created_by="u1",
            split_details=[_split("u1", 30.0), _split("u2", 30.0)],
        )
        settlements = calculate_settlements(group, [expense])

        assert len(settlements) == 1
        s = settlements[0]
        assert s["from_user_id"] == "u2"
        assert s["to_user_id"] == "u1"
        assert s["amount"] == 30.0

    def test_everyone_even_no_settlements(self):
        """Alice and Bob each pay $50 for each other's half — net zero."""
        group = _group([{"id": "u1", "name": "Alice"}, {"id": "u2", "name": "Bob"}])
        exp1 = _expense("u1", [_split("u1", 50.0), _split("u2", 50.0)])
        exp2 = _expense("u2", [_split("u1", 50.0), _split("u2", 50.0)])
        assert calculate_settlements(group, [exp1, exp2]) == []

    def test_three_people_one_payer(self):
        """Alice pays $90 for three people (Alice, Bob, Carol) split equally — $30 each."""
        group = _group(
            [{"id": "u1", "name": "Alice"}, {"id": "u2", "name": "Bob"}, {"id": "u3", "name": "Carol"}]
        )
        expense = _expense(
            "u1",
            [_split("u1", 30.0), _split("u2", 30.0), _split("u3", 30.0)],
        )
        settlements = calculate_settlements(group, [expense])

        # Both Bob and Carol owe Alice $30
        assert len(settlements) == 2
        payers = {s["from_user_id"] for s in settlements}
        assert payers == {"u2", "u3"}
        for s in settlements:
            assert s["to_user_id"] == "u1"
            assert s["amount"] == 30.0

    def test_multiple_expenses_accumulate_correctly(self):
        """
        Expense 1: Alice pays $50, Bob owes $50.
        Expense 2: Bob pays $20, Alice owes $20.
        Net: Bob owes Alice $30.
        """
        group = _group([{"id": "u1", "name": "Alice"}, {"id": "u2", "name": "Bob"}])
        exp1 = _expense("u1", [_split("u2", 50.0)])
        exp2 = _expense("u2", [_split("u1", 20.0)])
        settlements = calculate_settlements(group, [exp1, exp2])

        assert len(settlements) == 1
        assert settlements[0]["from_user_id"] == "u2"
        assert settlements[0]["to_user_id"] == "u1"
        assert settlements[0]["amount"] == 30.0

    def test_partial_amounts_rounded(self):
        """Settlement amounts should be rounded to 2 decimal places."""
        group = _group([{"id": "u1", "name": "Alice"}, {"id": "u2", "name": "Bob"}])
        expense = _expense("u1", [_split("u2", 33.333)])
        settlements = calculate_settlements(group, [expense])

        assert settlements[0]["amount"] == 33.33

    def test_single_member_group_no_settlements(self):
        """A group with one person cannot have any settlements."""
        group = _group([{"id": "u1", "name": "Alice"}])
        expense = _expense("u1", [_split("u1", 100.0)])
        assert calculate_settlements(group, [expense]) == []

    def test_payer_not_in_split_still_tracked(self):
        """Alice pays $100 but only Bob is in split_details — Alice is creditor."""
        group = _group([{"id": "u1", "name": "Alice"}, {"id": "u2", "name": "Bob"}])
        expense = _expense("u1", [_split("u2", 100.0)])
        settlements = calculate_settlements(group, [expense])

        assert len(settlements) == 1
        assert settlements[0]["from_user_id"] == "u2"
        assert settlements[0]["amount"] == 100.0
