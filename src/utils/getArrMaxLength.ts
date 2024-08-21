export function getArrMaxLength(arr: string[]): number {
    let result = -Infinity;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].length > result) {
            result = arr[i].length;
        }
    }
    return result;
}