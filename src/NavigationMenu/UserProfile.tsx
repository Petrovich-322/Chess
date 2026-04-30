import userService from "@/Services/userService";
import tokenService from "@/Services/tokenService";

const UserProfile = () => { 
    const isLoggedIn = tokenService.isLoggedIn;
    
    console.log(isLoggedIn);
    return (
        <div className="user-profile__container">
            {isLoggedIn && (
            <div className="user-profile">
                <div className="user-profile__title">
                    <img src = "/public/assets/def-user-icon.jpg"alt="/" className="user-profile__img" />
                    <span className="user-profile__name">{userService.UserName}</span>
                </div>
                <span className="user-profile__rating">{`Рейтинг: ${userService.Rating}`}</span>
            </div>
            )}
        </div>
    )   
}

export default UserProfile;