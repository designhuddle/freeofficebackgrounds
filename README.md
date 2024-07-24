# Free Office Backgrounds
Branded office backgrounds for Zoom, Google Meet, or Teams. Upload your logo to instantly generate a gallery of free virtual office background images.

## Technologies Used
- Design Huddle API
- JavaScript
- SASS
- HTML5
- Vite

## Getting Started

1. **Clone the Repository**

First, clone the repository to your local machine:

`git clone https://github.com/designhuddle/freeofficebackgrounds.git`

2. **Install Dependencies**

Navigate to the project directory and install the necessary dependencies:

`npm install`

3. **Create the `.env` File**

Create a `.env` file in the root directory of the project:

`touch .env`

4. **Configure Environment Variables**

Open the .env file and add the following environment variables:

- VITE_DOMAIN=xxx
- VITE_DSHD_DOMAIN=xxx
- VITE_DSHD_CLIENT_ID=xxx
- VITE_SPECIAL_USER_ACCESS_TOKEN=xxx
- VITE_ENV_MODE=production
- VITE_GOOGLE_ID=xxx (if using GTM)

5. **Run the Application**

To start the development server, run:

`npm run dev`

6. **Testing in Local Mode**

To run the application in local mode, set the `VITE_ENV_MODE` to `local` and run the following command:

`npm run dev`
