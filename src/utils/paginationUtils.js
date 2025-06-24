export const getPaginationDefaults = (pageIndex, pageSize) => {
    return {
        pageIndex: pageIndex || 0,
        pageSize: pageSize || 10,
    };
};
