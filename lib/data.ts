import { FaTasks } from "react-icons/fa"
import { FaDiagramProject } from "react-icons/fa6"
import { GoGoal, GoTasklist } from "react-icons/go"
import { IoChatbubbles } from "react-icons/io5"
import { RiChatPrivateLine } from "react-icons/ri"

export const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "🥹", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳", "🙂‍↕️", "😏", "😒", "🙂‍↔️", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😮‍💨", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🫣", "🤗", "🫡", "🤔", "🫢", "🤭", "🤫", "🤥", "😶", "😶‍🌫️", "😐", "😑", "😬", "🫨", "🫠", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "😵‍💫", "🫥", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾"
]

export const publicRoutes = [
    "/login", "/signup", "/verify", "/", ""
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
        quote:
            "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.",
        name: "Charles Dickens",
        title: "A Tale of Two Cities",
    },
    {
        quote:
            "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer The slings and arrows of outrageous fortune, Or to take Arms against a Sea of troubles, And by opposing end them: to die, to sleep.",
        name: "William Shakespeare",
        title: "Hamlet",
    },
    {
        quote: "All that we see or seem is but a dream within a dream.",
        name: "Edgar Allan Poe",
        title: "A Dream Within a Dream",
    },
    {
        quote:
            "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
        name: "Jane Austen",
        title: "Pride and Prejudice",
    },
    {
        quote:
            "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
        name: "Herman Melville",
        title: "Moby-Dick",
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