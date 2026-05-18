export const log = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;

    descriptor.value = function(...args: any[]) {
        const name = target.constructor.name;
        const info = `${name}->${propertyKey}`;
        const startTime = performance.now();
        const res = method.apply(this, args);
        const endTime = performance.now();
        const time = (endTime - startTime).toFixed(2);

        console.log(`LOG >>> ${info} звершено, час: ${time}`);
        return res;
    }
}