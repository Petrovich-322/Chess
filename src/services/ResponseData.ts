class ResponseData<T = Record<string, any>>  {
    status: 'success' | 'fail';
    data: T;
    constructor(status: 'success' | 'fail', data: T) {
        this.status = status
        this.data = data
    }
    get ok () {
        return this.status === 'success';
    }
}

export default ResponseData;