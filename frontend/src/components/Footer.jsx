const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-2 text-center flex-shrink-0 shadow-inner">
      <div className="container mx-auto text-sm">
        &copy; {new Date().getFullYear()} jxuholee. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer