![](design_files/logo_large.png)


A social media app designed for Tulane students to easily organize and join poker games on campus, compete and have fun!


## Code Contributions
### Bug Report
Please report any bug by opening an issue in the [repo](https://github.com/tpthanh2006/PokerUNew/issues/new?assignees=&labels=bug&projects=&template=bug-report.yml). Merci!

### Feature Suggestion
Please recommend any new features by describing your idea in this [form](https://github.com/tpthanh2006/PokerUNew/issues/new?assignees=&labels=enhancement&projects=&template=new-feature.yml). Gracias!

### Programming
1. **Fork the repository**: Click the "Fork" button at the top right corner of the repository page.
2. **Clone your fork**: 
    ```sh
    gh repo clone tpthanh2006/PokerU
    ```
3. **Create a new branch**: 
    ```sh
    git checkout -b feature-or-bugfix-name
    ```
4. **Make your changes**: Implement your feature or bug fix.
    ```sh
    cd .../software/frontend #to customize react-native frontend
    cd .../software/backend #to customize django backend
    ```
5. **Commit your changes**: 
    ```sh
    git add .
    git commit -m "Describe what you've changed"
    ```
6. **Push to your fork**: 
    ```sh
    git push origin feature-or-bugfix-name
    ```
7. **Create a pull request**: Go to the [original repository](https://github.com/tpthanh2006/PokerUNew/pulls) and click the "New pull request" button. Provide a detailed description of your changes.

### Code Conventions
Please follow these guidelines to maintain a consistent code style:

- Use 1 tab for indentation.
- Use descriptive and concise names for variables and functions.
- Adhere to these naming conventions:
  - Frontend:
    - Components: PascalCase
    - Global constants & enums: CONSTANT_CASE
  - Backend:
    - App: lowercase & underscores (e.g: blog_app)
    - Model: singular nouns, capitalized first letter (e.g: Person)
    - Field: lowercase & underscores (e.g: created_at)
    - URL: lowercase & hyphen-separated (e.g., /blog-posts/)
- Add comments to explain complex logic.

### Installation Guide
This guide is used for developers. An installation guide for users will be created once the beta version is launched.
1. **Install mobile emulator**:
- [Android](https://www.youtube.com/watch?v=jnBQcva98Y4)
- [iOS](https://www.youtube.com/watch?v=DloY4tyzKDA)
2. **Activate the terminal**: Open Bash, CMD, or PowerShell
3. **Install required packages**: Navigate to frontend and backend to install packages for React Native and Django
    ```sh
    cd .../software/frontend
    npm i #install all packages for npm
    
    cd .../software/backend
    python -m pip install django #install django packages
    python -m pip install django-cors-headers #install django-cors-headers packages
    ```
4. **Run backend for server site**: 
    ```sh
    cd .../software
    python manage.py makemigrations
    python manage.py migrate
    python manage.py runserver
    #click on local host link
    ```
5. **Run frontend for app site**: 
    ```sh
    cd .../software/frontend
    npm run dev
    #click on local host link
    ```
### Known Issues
- [Migrations are not up to date with new models](https://forum.djangoproject.com/t/deleting-a-model-cause-error-for-old-migrations-that-had-referenced-it/25743)


## ER Diagram
This diagram represents the data entities (users, games, host, players, friends) and their relationships within the campus poker app
![](design_files/erd.png)


# Contact
If you need further assistance or have some questions, reach out to us on [LinkedIn](https://www.linkedin.com/company/poker-u/).

Thank you for making PokerU come true!
