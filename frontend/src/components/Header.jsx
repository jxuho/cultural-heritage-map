import useUiStore from "../store/uiStore";
import { CgProfile } from "react-icons/cg";
import { FaThList, FaMapMarkedAlt } from "react-icons/fa";
import { useNavigate, useLocation } from 'react-router';

const Header = () => {
    const isAccountManagerOpen = useUiStore(
        (state) => state.isAccountManagerOpen
    );
    const openAccountManager = useUiStore((state) => state.openAccountManager);
    const closeAccountManager = useUiStore((state) => state.closeAccountManager);

    const navigate = useNavigate();
    const location = useLocation();

    // MODIFIED: Check if the current path is NOT the root path ('/')
    const isNotRootPath = location.pathname !== '/';

    const headerButtonsClickHandler = (option) => {
        switch (option) {
            case "accountManager":
                if (isAccountManagerOpen) {
                    closeAccountManager();
                } else {
                    openAccountManager();
                }
                break;
            case "toggleListView":
                // If currently not on the root path, navigate to the root path (map view)
                if (isNotRootPath) { // This handles cases like /list, /details, etc.
                    navigate('/');
                } else { // If currently on the root path, navigate to the list view
                    navigate('/list');
                }
                break;
            default:
                break;
        }
    };

    return (
        <header className="flex flex-row justify-between items-center h-12 text-white-text bg-chemnitz-blue">
            <nav className="container mx-auto flex justify-between items-center relative">
                {/* "See All Cultural Sites" / "Go to Map" 버튼을 맨 왼쪽으로 */}
                <div
                    id="toggleListViewButton"
                    className={`flex justify-center items-center h-12 w-12 hover:bg-[#44a1bd] transition ease-in-out duration-100 hover:cursor-pointer`}
                    onClick={() => headerButtonsClickHandler("toggleListView")}
                    // MODIFIED: Title and Icon based on isNotRootPath
                    title={isNotRootPath ? "Go to Map View" : "See All Cultural Sites"}
                >
                    {isNotRootPath ? (
                        <FaMapMarkedAlt size="20px" className="text-white" /> // Show map icon if not on root
                    ) : (
                        <FaThList size="20px" className="text-white" /> // Show list icon if on root
                    )}
                </div>

                {/* "Chemnitz Culture Finder" 텍스트를 중앙에 위치시키기 위해 absolute 포지셔닝 사용 */}
                <div className="absolute left-1/2 -translate-x-1/2">
                    <a
                        href="/"
                        className="text-2xl font-bold text-white hover:cursor-pointer"
                    >
                        Chemnitz Culture Finder
                    </a>
                </div>

                {/* Account manager 버튼은 우측 끝에 유지 */}
                <div className="flex items-center pr-4">
                    <div
                        id="accountManagerButton"
                        className={`flex justify-center items-center h-12 w-12 hover:bg-[#44a1bd] transition ease-in-out duration-100 hover:cursor-pointer`}
                        onClick={() => headerButtonsClickHandler("accountManager")}
                        title="Account manager"
                    >
                        <CgProfile size="20px" className="text-white" />
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;