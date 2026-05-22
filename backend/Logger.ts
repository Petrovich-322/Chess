import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const __date = () => {
    return new Date().toLocaleString('uk-UA')
}

const saveLogs = (data: string) => {
    fs.appendFile(path.resolve(__dirname, 'logs.txt'), data, 'utf-8', (err: unknown) => {
        if(err && err instanceof Error) console.error('ERROR >>> He вдалося зберегти логи', err);
    });
}

saveLogs(`\n--------------------New Server Start ${__date()}--------------------\n\n`)

export const log = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;

    descriptor.value = function(...args: any[]) {
        const name = target.constructor.name;
        const roomId = (this as any).roomId;
        const info = `${__date()} >>> [${roomId ?? 'not created'}]  Method: ${name}->${propertyKey}`;
        const startTime = performance.now();
        const res = method.apply(this, args);
        
        const logging = () => {
            const endTime = performance.now();
            const time = (endTime - startTime).toFixed(2);
            const data = `LOG >>> ${info} завершено за ${time}\n` 
            console.log(data);

            saveLogs(data);
        }

        if(res instanceof Promise) {
            return res.then((data) => {logging(); return data;},
            (error) => {logging(); throw error;}
        )};
        
        logging();
        return res;
    }
}
