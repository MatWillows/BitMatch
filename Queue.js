// generic Queue class , basicly extends array 
class Queue {
    // Array is used to implement a Queue 
    constructor() {
        this.items = [];
    }

    enqueue(element)
    {
        // adding element to the queue 
        this.items.push(element);
    } 
     
    dequeue() {
        // removing element from the queue 
        // throw error on calling on empty queue  
        // on empty queue 
        if (this.isEmpty())
            throw (new EmptyDequeueError("Invalid Match must have data"));
        return this.items.shift();
    }  

    
    peek() {
        // returns the Front element of  
        // the queue without removing it. 
        if (this.isEmpty())
            return null;
        return this.items[0];
    } 

    isEmpty()
    {
        // return true if the queue is empty. 
        return this.items.length == 0;
    }  

    ToString() {
        return JSON.stringify(this.items);
    }
} 

function EmptyDequeueError(message, extra) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    this.constructor.name;
    this.extra = extra;
}

module.exports.EmptyDequeueError = EmptyDequeueError;
module.exports.Queue = Queue;
