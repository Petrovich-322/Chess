import { hostAddress } from "./host";

const registration = async ({ userName, password }: {userName: string, password: string}) => {
    // const localStorageDataJSON = localStorage.getItem('DenisChess');
    // const localStorageData = localStorageDataJSON ? JSON.parse(localStorageDataJSON) : null;
    
    // if (localStorageData) {
    //     return localStorageData.userId;
    // }
    
    try {
        const response = await fetch (`${hostAddress}/get-user-id`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userName: userName, password: password })
        });

        if(!response.ok) {
            throw new Error (`Server response ${response.status}`)
        }

        const data = await response.json();
        console.log(data.text);
    } catch (err) {
        alert(`failed to get your id, please try later, server ans ${err}`)
        return 'spectator';
    }
}

export default registration;



