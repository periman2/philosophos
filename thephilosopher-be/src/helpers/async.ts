export const wait = async (time: number) => {
    return new Promise(r => setTimeout(r, time))
}

export const retry = async (fn: () => Promise<void>, times: number) => {
    for(let i = 0; i < times; i ++){
        try {
            await fn();
            break;
        }catch(ex){
            console.error(ex);
            console.log(`Retry ${i} failed, trying again.`)
        }
    }
}