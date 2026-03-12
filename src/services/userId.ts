import { hostAdress } from "./host";

const getUserId = async () => {
    const dataJSON = localStorage.getItem('DenisChess');

    if (dataJSON) {
        return JSON.parse(dataJSON);
    }
    
    try {
        const response = await fetch (`${hostAdress}/get-user-id`)

        if(!response.ok) {
            throw new Error (`Server response ${response.status}`)
        }

        const id = await response.json();
        localStorage.setItem('DenisChess', JSON.stringify({'userId': id}));
        return {
            'userId': id,
            'status': true,
        };
    } catch (err) {
        alert(`failed to get your id, please try later, server ans ${err}`)
        return {'status': false};
    }
}

export default getUserId;

