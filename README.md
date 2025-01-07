# PetStudio Web App:

App overview:
PetStudio is a simple web application that allows users to sign up, log in, create pet profiles, and manage a collection of pet information. The app functions as a Progressive Web App (PWA), storing user data locally for offline use.

Key Features:
Sign-Up and Login:

Users can sign up by providing a username and password, which are saved to localStorage.
After signing up, they can log in using the saved credentials.

Dashboard:
Upon successful login, users are redirected to the Dashboard where they can create and manage pet profiles.
Create and Manage Pet Profiles:

Users can create profiles for their pets by entering:
Pet Name
Breed
Date of Birth (DOB)
Pet Photos (via file upload)
Birthday Reminder Date
All pet profiles are stored in localStorage as a list and rendered on the dashboard.
View Pet Profiles:

Each pet profile is displayed with the following information:
Name
Breed
Date of Birth
Birthday Reminder
Photos
Users can view, delete, and print pet profiles:
Delete: Removes the pet profile from the list and updates localStorage.
Print: Allows users to print the pet profile without the delete or print buttons.

Data Persistence:
All pet profiles and user login credentials are saved to localStorage, ensuring data persistence even after closing and reopening the browser.

App Workflow:
Sign-Up Page: Users enter their credentials to create an account.
Login Page: After signing up, users log in to access the dashboard.
Dashboard: Once logged in, users can create new pet profiles or manage existing ones.
Pet Profiles: The app displays a list of pet profiles with the option to delete or print them.
Profile Management: Users can upload photos, edit pet details, and store them in their local storage..

## License

This project is licensed under the [Proprietary License](LICENSE).

Copyright © 2025 Dr. Karim Gad. All rights reserved.

This software and associated documentation files (the "Software") are proprietary and confidential. Unauthorized copying, modification, distribution, or use of the Software, in whole or in part, is strictly prohibited.

Permission is hereby granted, free of charge, to the purchaser of a copy of the Software, to use the Software for personal or internal business purposes only. The Software may not be sublicensed, sold, or redistributed without explicit prior written permission from the copyright holder.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

For permissions or inquiries, please check the (LICENSE)
