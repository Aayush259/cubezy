import { IoIosSearch } from "react-icons/io"

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string
    labelClassName?: string
    inputClassName?: string
}

const Search: React.FC<SearchProps> = ({ id, labelClassName, inputClassName, ...props }) => {
    return (
        <label htmlFor={id} className={`flex px-4 py-1 items-center border bg-gray-800 border-gray-800 rounded-full w-full ${labelClassName}`}>
            <input
                id={id}
                className={`bg-transparent w-full outline-none ${inputClassName}`}
                {...props}
            />
            <IoIosSearch size={20} />
        </label>
    )
}

export default Search