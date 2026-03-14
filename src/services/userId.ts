import { hostAdress } from "./host";

const getUserId = async (checker: string) => {
    const dataJSON = localStorage.getItem('DenisChess');

    if (dataJSON && checker!='newUser') {
        return JSON.parse(dataJSON).userId;
    }
    
    try {
        const response = await fetch (`${hostAdress}/get-user-id`)

        if(!response.ok) {
            throw new Error (`Server response ${response.status}`)
        }

        const id = await response.json();
        localStorage.setItem('DenisChess', JSON.stringify({userId: id}));
        return id;
    } catch (err) {
        alert(`failed to get your id, please try later, server ans ${err}`)
        return 'spectator';
    }
}

export default getUserId;



