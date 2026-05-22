import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const __date = () => {
    return new Date().toLocaleString('uk-UA')
}

type LogLevel = 'INFO' | 'DEBUG' | 'ERROR';

const saveLogs = (data: string) => {
    fs.appendFile(path.resolve(__dirname, '__logs.txt'), data, 'utf-8', (err: unknown) => {
        if(err && err instanceof Error) console.error('ERROR >>> He вдалося зберегти логи', err);
    });
}

saveLogs(`\n--------------------New Server Start ${__date()}--------------------\n\n`);

export const logMethod = (level: LogLevel) => {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;

        descriptor.value = function(...args: any[]) {
            const name = target.constructor.name;
            const roomId = (this as any).roomId;
            const info = `[${roomId ?? '/'}]  Method: ${name}->${propertyKey} >>> ${__date()}`;
            const startTime = performance.now();
            
            const logging = () => {
                const endTime = performance.now();
                const time = (endTime - startTime).toFixed(2);
                const data = `${level} >>> ${info} завершено за ${time}\n` ;
                console.log(data);

                saveLogs(data);
            }
            
            try {
                const res = method.apply(this, args);
                    
                if(res instanceof Promise) {
                    return res.then(
                        (data) => {
                            if(level === 'INFO' || level === 'DEBUG') logging(); 
                            return data;
                        },
                        (error) => {
                            if(level === 'ERROR' || level === 'DEBUG') logging();
                            throw error;
                        }
                    );
                };
            
                if(level === 'INFO' || level === 'DEBUG') logging();   

                return res;
            } catch (error) {
                if(level === 'ERROR' || level === 'DEBUG') logging();
                throw error; 
            }
        }
    }
}