import './UserInfo.css'

const UserInfo = (props: {userSide: string}) => {
    const {
        userSide,
    } = props;
    return (
        <div id="user-info-container">
            <div className="side-info-container">
                <p className='user-side-title'>Your side</p>
                <p className="user-side-text">{`${userSide == 'w' ? 'White' : 'Black'}`}</p>
            </div>
        </div>
    )
}

export default UserInfo;