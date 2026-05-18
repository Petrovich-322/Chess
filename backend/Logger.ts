import fs from 'fs';
import path from 'path';

export const log = async (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;

    descriptor.value = function(...args: any[]) {
        const name = target.constructor.name;
        const roomId = (this as any).roomId;
        const info = `[${roomId}]  Method: ${name}->${propertyKey}`;
        const startTime = performance.now();
        const res = method.apply(this, args);
        
        const logging = async () => {
            const endTime = performance.now();
            const time = (endTime - startTime).toFixed(2);
            const data = `LOG >>> ${info} завершено за ${time}` 
            console.log(data);

            try {
                // await fs.appendFile(path.resolve('logs.txt'), data, 'utf-8');
            } catch (err) {
                // console.error('ERROR >>> не вдалося зберегти файл логів');
            }
        }

        if(res instanceof Promise) {
            return res.then((data) => {await logging(); return data;},
            (error) => {await logging(); throw error;}
        )};
        
        await logging();
        return res;
    }
}