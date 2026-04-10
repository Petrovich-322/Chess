const log = (method) => {
    return function(...args) {
        const result = method.apply(this, args);
        console.log(`${method.name}: ${result}`);
        return result;
    }
}

class biDirectionalPriorityQueue {
    timeElements = [];
    priorityElements = [];
    length = 0;
    
    constructor() {
        this.peek = log(this.peek);
        this.dequeue = log(this.dequeue);
    }

    enqueue(item, priority) {
        const node = { item, priority };

        this.timeElements.push(node);
        this.priorityElements.push(node);
        
        this.priorityElements.sort((a, b) => b.priority - a.priority);
        this.length++;
    }

    sync(removedNode, array) {
        const index = array.indexOf(removedNode);
        if(index === -1) return;
        array.splice(index, 1);
    }

    dequeue(type) {
        if(this.length === 0) return null;

        let removedNode, array;

        switch(type) {
             case 'oldest':
                removedNode = this.timeElements.shift();
                array = this.priorityElements;
                break;
            case 'newest':
                removedNode = this.timeElements.pop();
                array = this.priorityElements;
                break;
            case 'highestPriority':
                removedNode = this.priorityElements.shift();
                array = this.timeElements;
                break;
            case 'lowestPriority':
                removedNode = this.priorityElements.pop();
                array = this.timeElements;
                break;
            default:
                return null;
        }

        this.sync(removedNode, array);
        this.length--;
        return removedNode.item;
    }

    peek(type) {
        if(this.length === 0) return null;
        
        switch(type) {
            case 'oldest': return this.timeElements[0].item;
            case 'newest': return this.timeElements[this.timeElements.length - 1].item;
            case 'highestPriority': return this.priorityElements[0].item;
            case 'lowestPriority': return this.priorityElements[this.priorityElements.length - 1].item;
            default: return null;
        }
    }
}

const queue = new biDirectionalPriorityQueue();
queue.enqueue('Task 1', 2);
queue.enqueue('Task 2', 1);
queue.enqueue('Task 3', 3);

queue.peek('newest');
queue.peek('highestPriority');
queue.peek('oldest');

queue.dequeue('newest');
queue.dequeue('highestPriority');

queue.peek('newest');
queue.peek('highestPriority');
queue.peek('oldest');