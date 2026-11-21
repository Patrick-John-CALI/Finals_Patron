# Finals_Patron
Patron -  OrangeHRM (Human Resources Management): https://opensource-demo.orangehrmlive.com/ 

Packages need to install:
npm install -D dotenv @types/node

mkdir "folder name"
cd "folder name"
npm init playwright@latest

.env file
ORANGE_USERNAME=Admin
ORANGE_PASSWORD=admin123
ORANGE_API_TOKEN="new token every 30 minutes"

Step 1: Login to OrangeHRM test website
Step 2: Open Admin Menu
Step 3: Go to Configuration then select Register OAuth Client
Step 4: Click Add Button
Step 5: Add Name
Step 6: Add Redirect URL (https://pstmn.io)
Step 7: Click Save
Step 8: Go to Postman and click Authorization
Step 9: Select OAuth 2.0
Step 10: Select Grant Type: Authorization Code
Step 11: Add your Callback URL, Auth URL, Access Token URL
Step 12: Add your Client ID and Secret
Step 13: Client Authentication: click send client credentials in body
Step 14: Click Get New Access Token
Step 15: Click Allow Access
Step 16: Use Token

