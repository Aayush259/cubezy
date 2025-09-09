import { FaTasks } from "react-icons/fa"
import { IoChatbubbles } from "react-icons/io5"
import { RiChatPrivateLine } from "react-icons/ri"
import { FaDiagramProject } from "react-icons/fa6"
import { GoGoal, GoTasklist } from "react-icons/go"

export const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "🥹", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳", "🙂‍↕️", "😏", "😒", "🙂‍↔️", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😮‍💨", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🫣", "🤗", "🫡", "🤔", "🫢", "🤭", "🤫", "🤥", "😶", "😶‍🌫️", "😐", "😑", "😬", "🫨", "🫠", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "😵‍💫", "🫥", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾"
]

export const publicRoutes = [
    "/login", "/signup", "/verify", "/", "", "/sitemap.xml", "/robots.txt"
]

export const publicApiRoutes = [
    "/api/auth/login", "/api/auth/signup", "/api/auth/verify", "/api/socket/connect", "/api/auth/refresh"
]

export const navLinks = [
    {
        label: "Home",
        href: "/"
    },
    {
        label: "Features",
        href: "/about"
    },
    {
        label: "Pricing",
        href: "/pricing"
    },
    {
        label: "Contact",
        href: "/contact"
    },
    {
        label: "FAQ",
        href: "/faq"
    }
]

export const featuresForBetterExperience = [
    {
        icon: IoChatbubbles,
        bgColor: "#FD600333",
        iconColor: "#F23936",
        title: "Seamless communication",
        description: "Engage in real-time conversations with team members, ensuring everyone stays informed and connected."
    },
    {
        icon: FaTasks,
        bgColor: "#4DA44E33",
        iconColor: "#4DA44E",
        title: "Efficient task management",
        description: "Organize tasks efficiently with intuitive management tools that help you prioritize and track progress effortlessly."
    },
    {
        icon: RiChatPrivateLine,
        bgColor: "#FB8E0B33",
        iconColor: "#FB8E0B",
        title: "Keep safe and private",
        description: "Enjoy secure messaging with end-to-end encryption, ensuring your conversations remain confidential."
    }
]

export const workflowFeatures = [
    {
        icon: GoGoal,
        title: "Optimize Your Goals",
        description: "Set, track, and achieve your objectives with tools designed to keep you focused and motivated.",
        color: "#ED4546"
    },
    {
        icon: FaDiagramProject,
        title: "Project Tracking",
        description: "Monitor project timelines and milestones in real-time. Keep projects on track and meet your deadlines with confidence.",
        color: "#008EFF"
    },
    {
        icon: GoTasklist,
        title: "Task Management",
        description: "Easily manage tasks, deadlines, and priorities to keep projects running smoothly.",
        color: "#77F393"
    }
]

export const testimonials = [
    {
        quote: "Cubezy has completely transformed how our team collaborates. The seamless communication and task management features have increased our productivity by 40%. The end-to-end encryption gives us peace of mind for sensitive project discussions.",
        name: "Sarah Chen",
        title: "Project Manager at TechFlow Solutions",
    },
    {
        quote: "As a startup founder, I needed a platform that could handle both team communication and project tracking. Cubezy delivers exactly that - it's intuitive, secure, and has helped us stay organized as we scale our business",
        name: "Marcus Rodriguez",
        title: "CEO of InnovateLab",
    },
    {
        quote: "The real-time messaging combined with task management is a game-changer. Our remote team feels more connected than ever, and we can track project progress without switching between multiple tools.",
        name: "Emily Watson",
        title: "Operations Director at RemoteFirst Inc.",
    },
    {
        quote: "Cubezy's security features were crucial for our healthcare consulting firm. The end-to-end encryption ensures our client communications remain confidential while the task management keeps our projects on track.",
        name: "Dr. James Thompson",
        title: "Senior Consultant at HealthTech Partners",
    },
    {
        quote: "We switched from Slack to Cubezy and haven't looked back. The integrated task management saves us hours every week, and the interface is so clean and user-friendly that our entire team adopted it within days.",
        name: "Lisa Park",
        title: "Marketing Director at Creative Agency Pro",
    }
]

export const faqs = [
    {
        question: "What is Cubezy?",
        answer: "Cubezy is a modern and intuitive chat application designed to facilitate seamless communication and connection among users. It offers a range of features to enhance your messaging experience."
    },
    {
        question: "How do I create an account?",
        answer: "To create an account, simply click on the 'Sign Up' button on the homepage and fill in the required information, including your email address and password. Follow the prompts to complete the registration process."
    },
    {
        question: "Is Cubezy free to use?",
        answer: "Yes, Cubezy offers a free plan with essential features for personal use. We also have premium plans with additional features for businesses and teams."
    },
    {
        question: "Can I use Cubezy on my mobile device?",
        answer: "Absolutely! Cubezy is designed to be responsive and works seamlessly on both desktop and mobile devices. You can access it through your web browser or download our mobile app from the App Store or Google Play."
    },
    {
        question: "How do I reset my password?",
        answer: "If you've forgotten your password, click on the 'Forgot Password' link on the login page. Enter your registered email address, and we'll send you instructions to reset your password."
    }
]