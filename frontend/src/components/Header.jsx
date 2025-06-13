import useUiStore from "../store/uiStore";
import { CgProfile } from "react-icons/cg";

const Header = () => {
  const isAccountManagerOpen = useUiStore(
    (state) => state.isAccountManagerOpen
  );
  const openAccountManager = useUiStore((state) => state.openAccountManager);
  const closeAccountManager = useUiStore((state) => state.closeAccountManager);

  const headerButtonsClickHandler = (option) => {
    switch (option) {
      case "accountManager":
        if (isAccountManagerOpen) {
          closeAccountManager();
        } else {
          openAccountManager();
        }
        break;
      default:
        break;
    }
  };

  return (
    <header className="flex flex-row justify-between items-center h-12 text-white-text bg-chemnitz-blue">
      <nav className="container mx-auto flex justify-between items-center">
        <a
          href="/"
          className="text-2xl font-bold text-white hover:cursor-pointer pl-4 "
        >
          Chemnitz Culture Finder
        </a>
        <div
          id="accountManagerButton"
          className={`flex justify-center items-center h-12 w-12 hover:bg-[#44a1bd] transition ease-in-out duration-100 hover:cursor-pointer`}
          onClick={() => headerButtonsClickHandler("accountManager")}
          title="Account manager"
        >
          <CgProfile size="20px" className="text-white" />
        </div>
      </nav>
    </header>
  );
};

export default Header;
