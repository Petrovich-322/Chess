export class responseData {
    message: string;
    name: string;
    
    constructor({ message = '', name = 'Server Response' } = {}) {
        this.message = message,
        this.name = name
    }
}