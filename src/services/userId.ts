import { hostAddress } from "./host";

const getUserId = async (checker: string) => {
    const localStorageDataJSON = localStorage.getItem('DenisChess');
    const localStorageData = localStorageDataJSON ? JSON.parse(localStorageDataJSON) : null;
    
    if (localStorageData && localStorageData.userId && checker!='newUser') {
        return localStorageData.userId;
    }
    
    try {
        const response = await fetch (`${hostAddress}/get-user-id`)

        if(!response.ok) {
            throw new Error (`Server response ${response.status}`)
        }

        const id = await response.json();

        const roomId = (localStorageData ? 
                (localStorageData.prevRoomId ?? null) : null); 
        
        localStorage.setItem('DenisChess', JSON.stringify({userId: id, prevRoomId: roomId}));
        return id;
    } catch (err) {
        alert(`failed to get your id, please try later, server ans ${err}`)
        return 'spectator';
    }
}

export default getUserId;



