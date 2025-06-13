import { Outlet } from "react-router";


const MyAccountPage = () => {
  return (
    <div className="w-full h-full p-12 mx-auto max-w-[1680px] overflow-auto">
      <Outlet /> 
    </div>
  );
};

export default MyAccountPage;












// const MyAccountPage = () => {
//   const user = useAuthStore((state) => state.user);
//   const logout = useAuthStore((state) => state.logout);

//   const openModal = useUiStore((state) => state.openModal);
//   const closeModal = useUiStore((state) => state.closeModal);

//   const signOutHandler = () => {
//     // signout
//     openModal(
//       <div>
//         <h3 className="text-lg font-bold mb-2">Sign Out?</h3>
//         <p>Are you sure you want to sign out of your account?</p>
//         <button
//           onClick={() => {
//             closeModal();
//             logout();
//             window.location.reload();
//           }}
//           className="mt-3 px-3 py-1.5 bg-red-500 text-white rounded hover:cursor-pointer font-semibold"
//         >
//           Sign Out
//         </button>
//       </div>
//     );
//   };

//   return (
//     <div className="w-full h-full p-12 mx-auto max-w-[1680px] overflow-auto">
//       <div className="m-6 grid gap-12 grid-cols-1 min-[640px]:grid-cols-2 min-[900px]:grid-cols-3 xl:grid-cols-4">
//         {/* Profile */}
//         <div
//           className="min-[640px]:h-[600px] row-span-2 flex flex-col justify-between max-w-xs p-4 bg-white rounded"
//           style={{
//             boxShadow:
//               "0px 5px 10px rgba(0,0,0,0.1), 0px 1.6px 3.6px rgba(0,0,0,0.1)",
//           }}
//         >
//           <div className="flex flex-col items-center">
//             <div className="w-20 h-20 overflow-hidden rounded-full">
//               {user.profileImage ? (
//                 <img
//                   className="rounded-full"
//                   src={user.profileImage}
//                   alt="profile image"
//                   referrerPolicy="no-referrer"
//                 />
//               ) : (
//                 <img
//                   className="rounded-full"
//                   src={defaultProfileImg}
//                   alt="profile image"
//                 />
//               )}
//             </div>
//             {/* 중간에 통계 작성하면 좋을 듯 */}
//             <div className="flex flex-col items-center my-2 ">
//               <div className="text-2xl font-medium mb-2">
//                 {user.username ?? user.email}
//               </div>
//               <div className="font-normal mb-2">{user.email}</div>
//             </div>
//           </div>

//           <button
//             onClick={signOutHandler}
//             className="flex justify-center border-t pt-3 font-medium border-bg-border text-chemnitz-blue hover:cursor-pointer hover:underline"
//           >
//             Sign out
//           </button>
//         </div>

//         {/* Update Profile */}
//         <div
//           className="flex flex-col max-w-xs p-4 bg-white rounded h-full row-span-1"
//           style={{
//             boxShadow:
//               "0px 5px 10px rgba(0,0,0,0.1), 0px 1.6px 3.6px rgba(0,0,0,0.1)",
//           }}
//         >
//           <div className="flex flex-col items-center justify-between h-full mt-4">
//             <div className="flex flex-col items-center">
//               <div className="text-2xl font-normal pb-4 max-[400px]:text-lg">
//                 Profile
//               </div>

//               <PiUserCircleThin
//                 className="text-light-text scale-x-[-1]"
//                 size={"60px"}
//               />

//               <p className="py-3 text-center">
//                 Update your personal information.
//               </p>
//             </div>

//             <Link
//               className="font-medium text-chemnitz-blue flex hover:underline hover:cursor-pointer pb-2 pt-4 border-t"
//               to=""
//             >
//               <span
//                 className="uppercase max-[400px]:text-sm"
//                 title="update profile"
//               >
//                 Update Profile
//               </span>
//               <span>
//                 <MdKeyboardArrowRight size={"22px"} />
//               </span>
//             </Link>
//           </div>
//         </div>

//         {/* Favorite sites */}
//         <div
//           className="flex flex-col max-w-xs p-4 bg-white rounded h-full row-span-1"
//           style={{
//             boxShadow:
//               "0px 5px 10px rgba(0,0,0,0.1), 0px 1.6px 3.6px rgba(0,0,0,0.1)",
//           }}
//         >
//           <div className="flex flex-col items-center justify-between h-full mt-4">
//             <div className="flex flex-col items-center">
//               <div className="text-2xl font-normal pb-4 max-[400px]:text-lg">
//                 Favorite Sites
//               </div>

//               <PiMapPinLineThin
//                 className="text-light-text scale-x-[-1]"
//                 size={"60px"}
//               />

//               <p className="py-3 text-center">
//                 See your favorite cultural sites.
//               </p>
//             </div>

//             <Link
//               className="font-medium text-chemnitz-blue flex hover:underline hover:cursor-pointer pb-2 pt-4 border-t"
//               to=""
//             >
//               <span
//                 className="uppercase max-[400px]:text-sm"
//                 title="go to favorites"
//               >
//                 Go to favorites
//               </span>
//               <span>
//                 <MdKeyboardArrowRight size={"22px"} />
//               </span>
//             </Link>
//           </div>
//         </div>
//         {/* Reviews */}
//         <div
//           className="flex flex-col max-w-xs p-4 bg-white rounded h-full row-span-1"
//           style={{
//             boxShadow:
//               "0px 5px 10px rgba(0,0,0,0.1), 0px 1.6px 3.6px rgba(0,0,0,0.1)",
//           }}
//         >
//           <div className="flex flex-col items-center justify-between h-full mt-4">
//             <div className="flex flex-col items-center">
//               <div className="text-2xl font-normal pb-4 max-[400px]:text-lg">
//                 Reviews
//               </div>

//               <PiChatCircleTextThin
//                 className="text-light-text scale-x-[-1]"
//                 size={"60px"}
//               />

//               <p className="py-3 text-center">Check your reviews</p>
//             </div>

//             <Link
//               className="font-medium text-chemnitz-blue flex hover:underline hover:cursor-pointer pb-2 pt-4 border-t"
//               to=""
//             >
//               <span
//                 className="uppercase max-[400px]:text-sm"
//                 title="check reviews"
//               >
//                 Check reviews
//               </span>
//               <span>
//                 <MdKeyboardArrowRight size={"22px"} />
//               </span>
//             </Link>
//           </div>
//         </div>

//         {/* Delete Account */}
//         <div
//           className="flex flex-col max-w-xs p-4 bg-white rounded h-full row-span-1 "
//           style={{
//             boxShadow:
//               "0px 5px 10px rgba(0,0,0,0.1), 0px 1.6px 3.6px rgba(0,0,0,0.1)",
//           }}
//         >
//           <div className="flex flex-col items-center justify-between h-full mt-4">
//             <div className="flex flex-col items-center">
//               <div className="text-2xl font-normal pb-4 max-[400px]:text-lg">
//                 Delete Account
//               </div>

//               <PiTrashThin
//                 className="text-light-text scale-x-[-1]"
//                 size={"60px"}
//               />

//               <p className="py-3 text-center">
//                 Delete your account. <br />
//                 You can't recover the data.
//               </p>
//             </div>
//             <Link
//               className="font-medium text-alert-error flex hover:underline hover:cursor-pointer pb-2 pt-4  border-t "
//               to=""
//             >
//               <span
//                 className="uppercase max-[400px]:text-xs"
//                 title="delete account"
//               >
//                 Delete Account
//               </span>
//               <span>
//                 <MdKeyboardArrowRight size={"22px"} />
//               </span>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MyAccountPage;
