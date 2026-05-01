import jwt from 'jsonwebtoken';

const verifyToken = (req: any, res: any, next: any) => {
    
    console.log('---verify token---');

    const authData = req.headers['authorization'];
    const token = authData.split(' ')[1];

    // console.log(`DEBUG-auth: ${authData}`);
    // console.log(`DEBUG-token: ${token}`);
    // console.log(`DEBUG-API_KEY: ${process.env.API_KEY}`);

    if(!token) {
        console.log('token not in headers');
        res.status(401).json({ message: 'Ви не авторизовані, запит неможливий' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.API_KEY as string);
        req.decoded = {user: decoded};
        next();
    } catch (error) {
        console.log('token verification failed');
        res.status(401).json({ message: 'Ви не авторизовані, запит неможливий' });
    }

}

export default verifyToken;