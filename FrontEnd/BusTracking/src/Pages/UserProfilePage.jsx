import UserProfile from "../Components/UserProfile";


const UserProfilePage = () => {
    return (
      <>
        
        <div className="demo-container">
          <div className="demo-header">
            <h1 className="demo-title">Student Bus Tracking</h1>
            <p className="demo-subtitle">View and manage student transportation details in one place</p>
          </div>
          <UserProfile/>
        </div>
      </>
    );
}

export default UserProfilePage;