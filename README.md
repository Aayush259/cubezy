# 💬 Cubezy - A Real-Time Chat Application

Cubezy is a real-time chat application built using modern web technologies. It allows users to connect, chat, and manage profiles with seamless updates and an intuitive user interface.

## 🌟 Features

1. **User Management:**
   - **Signup:** Create an account with a name, email, and password. Email is unique for every user.
   - **Login:** Authenticate users securely using JWT.
   - User passwords are securely hashed using *bcrypt*.
   - **Profile Management:**
        - View profile with name, email, optional profile picture, bio, connections list, and joining date.
        - Update and Edit profile picture using Cloudinary for storage by clicking on profile picture.
        - Update bio by clicking on the *"Edit" (Pencil)* button.
        - Real-time profile updates reflected across all connections.

    - **Connections:**
        - Add new connections using their *unique email address*.
        - Display connections with profile picture, name, and last message with timestamp in sidebar.
        - Highlight unread messages with bold text and notification dots in sidebar.
        - Show real-time online status of connections in the chat window.

    - **Chat Features:**
        - **Messaging:**
            - Real-time send and receive messages using sockets.
            - Fetch chat history dynamically via the API with pagination. Messages are loaded 20 at a time as the user scrolls up.
            - Group messages by date with labels ("Today," "Yesterday," or specific dates).
            - Display read receipts (single white tick for sent, double blue tick for read).
            - Include timestamps for each message.
        - **Emojis:** Send emojis along with text messages using an emoji panel.
        - **Long-Press Actions:**
            - Soft delete messages (IDs stored in DB and filtered during fetch).
            -  Copy selected messages to the clipboard.
            - **Forward Messages:**
                - Forward messages to other connections via a popup interface.
                - Search and select connections to forward messages.
        - **Link Formatting:** Automatically detect and format links, emails, and phone numbers in messages. These are displayed as clickable links that open in a new tab.

    - **Notifications:** Notify users of new messages from other connections.

    - **Sidebar:**
        - Display user's name, optional profile picture, and a greeting based on the time of day with random emoji.
        - Sticky *Add Connection* button for quick connection management.
        - Connection list with live updates.

    - **Real-Time Features:**
        - Socket-based updates for: New messages, Profile changes, online status, sidebar updates.

## API Endpoints

- **Authentication Routes:**
    - `/auth/signup`: Register a new user.
    - `/auth/login`: Authenticate and generate a JWT.
    - `/auth/getUser`: Validate login and fetch user info.

- **Profile Management:**
    - `/auth/getProfileInfo`: Retrives user profile details.
    - `/auth/addConnection`: Add a new connection.

- **Messages:**
    - `/messages/getMessages`: Fetch chat history for a specific connection. Supports pagination with page and limit parameters. By default, returns 20 messages per request, dynamically loaded as the user scrolls up in the chat window.
    - `/messages/getLastMessages`: Fetch last messages for each connection.
    - `/messages/getUnreadMessages`: Retrieve unread messages.

- **Sockets:**
    - `/socket/connect`: Handle all real-time updates and interactions.

## 🚀 Usage

- Create an account or log in.
- Use the "Add Connection" button in the sidebar and add your friend using its email.
- Select a connection from the sidebar to open the chat window.

## 🛠️ Tech Stack

- Framework: Next JS with TypeScript
- Frontend: Tailwind CSS, React Icons, Redux Toolkit, Socket.io-client, uuid
- Backend: MongoDB, Socket.io, bcrypt, JWT, Cloudinary

## 📬 Feedback and Suggestions

Your feedback is valuable! If you have any suggestions, ideas, or improvements for this project, please feel free to open an issue or submit a pull request. Your contributions are welcomed and appreciated 🚀.
