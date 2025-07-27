
export default function Loader() {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <svg className="loadingSvg" viewBox="25 25 50 50">
                <circle className="loadingCircle" r="20" cy="50" cx="50" />
            </svg>
        </div>
    )
}
