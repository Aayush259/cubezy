import { FaTasks } from "react-icons/fa"
import { FaDiagramProject } from "react-icons/fa6"
import { GoGoal, GoTasklist } from "react-icons/go"
import { IoChatbubbles } from "react-icons/io5"
import { RiChatPrivateLine } from "react-icons/ri"

export const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "🥹", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳", "🙂‍↕️", "😏", "😒", "🙂‍↔️", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😮‍💨", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🫣", "🤗", "🫡", "🤔", "🫢", "🤭", "🤫", "🤥", "😶", "😶‍🌫️", "😐", "😑", "😬", "🫨", "🫠", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "😵‍💫", "🫥", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾"
]

export const publicRoutes = [
    "/login", "/signup", "/verify", "/"
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