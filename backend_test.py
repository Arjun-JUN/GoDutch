import requests
import sys
import json
import base64
from datetime import datetime
from io import BytesIO
from PIL import Image

class ExpenseSplitterAPITester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    # Remove Content-Type for file uploads
                    headers.pop('Content-Type', None)
                    response = requests.post(url, data=data, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    self.log_test(name, True)
                    return True, response_data
                except:
                    self.log_test(name, True)
                    return True, {}
            else:
                try:
                    error_data = response.json()
                    self.log_test(name, False, f"Status {response.status_code}: {error_data}")
                except:
                    self.log_test(name, False, f"Status {response.status_code}: {response.text}")
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def create_test_image(self):
        """Create a simple test receipt image in base64 format"""
        # Create a simple receipt-like image
        img = Image.new('RGB', (400, 600), color='white')
        
        # Convert to base64
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return img_base64

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_user_data = {
            "email": f"testuser{timestamp}@example.com",
            "password": "TestPass123!",
            "name": f"Test User {timestamp}"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            self.test_user_email = test_user_data['email']
            return True
        return False

    def test_user_login(self):
        """Test user login with registered user"""
        if not hasattr(self, 'test_user_email'):
            self.log_test("User Login", False, "No test user email available")
            return False
            
        login_data = {
            "email": self.test_user_email,
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            return True
        return False

    def test_create_group(self):
        """Test group creation"""
        if not self.token:
            self.log_test("Create Group", False, "No auth token")
            return None
            
        # First create another test user for the group
        timestamp = datetime.now().strftime('%H%M%S')
        member_data = {
            "email": f"member{timestamp}@example.com",
            "password": "TestPass123!",
            "name": f"Member {timestamp}"
        }
        
        # Register member user
        member_success, member_response = self.run_test(
            "Register Group Member",
            "POST",
            "auth/register",
            200,
            data=member_data
        )
        
        if not member_success:
            return None
            
        group_data = {
            "name": f"Test Group {timestamp}",
            "member_emails": [self.test_user_email, member_data['email']]
        }
        
        success, response = self.run_test(
            "Create Group",
            "POST",
            "groups",
            200,
            data=group_data
        )
        
        if success and 'id' in response:
            self.test_group_id = response['id']
            return response['id']
        return None

    def test_get_groups(self):
        """Test getting user groups"""
        success, response = self.run_test(
            "Get Groups",
            "GET",
            "groups",
            200
        )
        return success

    def test_ocr_scan(self):
        """Test OCR scanning functionality"""
        if not self.token:
            self.log_test("OCR Scan", False, "No auth token")
            return False
            
        # Create a test image
        test_image_base64 = self.create_test_image()
        
        ocr_data = {
            "image_base64": test_image_base64
        }
        
        success, response = self.run_test(
            "OCR Scan Receipt",
            "POST",
            "ocr/scan",
            200,
            data=ocr_data
        )
        
        if success:
            # Check if response has expected OCR fields
            expected_fields = ['merchant', 'date', 'total_amount', 'items']
            has_all_fields = all(field in response for field in expected_fields)
            if not has_all_fields:
                self.log_test("OCR Response Structure", False, f"Missing fields in response: {response}")
                return False
            else:
                self.log_test("OCR Response Structure", True)
                
        return success

    def test_create_expense(self):
        """Test expense creation"""
        if not self.token or not hasattr(self, 'test_group_id'):
            self.log_test("Create Expense", False, "No auth token or group ID")
            return None
            
        expense_data = {
            "group_id": self.test_group_id,
            "merchant": "Test Restaurant",
            "date": "2024-01-15",
            "total_amount": 50.00,
            "items": [
                {"name": "Pizza", "price": 25.00, "assigned_to": []},
                {"name": "Drinks", "price": 25.00, "assigned_to": []}
            ],
            "split_type": "equal",
            "split_details": [
                {"user_id": self.user_id, "user_name": "Test User", "amount": 25.00}
            ],
            "receipt_image": None
        }
        
        success, response = self.run_test(
            "Create Expense",
            "POST",
            "expenses",
            200,
            data=expense_data
        )
        
        if success and 'id' in response:
            self.test_expense_id = response['id']
            return response['id']
        return None

    def test_get_group_expenses(self):
        """Test getting group expenses"""
        if not hasattr(self, 'test_group_id'):
            self.log_test("Get Group Expenses", False, "No test group ID")
            return False
            
        success, response = self.run_test(
            "Get Group Expenses",
            "GET",
            f"groups/{self.test_group_id}/expenses",
            200
        )
        return success

    def test_get_settlements(self):
        """Test getting settlements"""
        if not hasattr(self, 'test_group_id'):
            self.log_test("Get Settlements", False, "No test group ID")
            return False
            
        success, response = self.run_test(
            "Get Settlements",
            "GET",
            f"groups/{self.test_group_id}/settlements",
            200
        )
        return success

    def test_invalid_auth(self):
        """Test endpoints with invalid authentication"""
        # Save current token
        original_token = self.token
        self.token = "invalid_token"
        
        success, response = self.run_test(
            "Invalid Auth Test",
            "GET",
            "groups",
            401
        )
        
        # Restore original token
        self.token = original_token
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting OCR Expense Splitter API Tests")
        print(f"   Base URL: {self.base_url}")
        print("=" * 60)

        # Authentication tests
        if not self.test_user_registration():
            print("❌ Registration failed, stopping tests")
            return self.get_summary()

        if not self.test_user_login():
            print("❌ Login failed, stopping tests")
            return self.get_summary()

        # Group management tests
        group_id = self.test_create_group()
        if group_id:
            self.test_get_groups()

        # OCR functionality test
        self.test_ocr_scan()

        # Expense management tests
        if group_id:
            expense_id = self.test_create_expense()
            if expense_id:
                self.test_get_group_expenses()
                self.test_get_settlements()

        # Security tests
        self.test_invalid_auth()

        return self.get_summary()

    def get_summary(self):
        """Get test summary"""
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   - {result['name']}: {result['details']}")
            return 1

def main():
    tester = ExpenseSplitterAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
