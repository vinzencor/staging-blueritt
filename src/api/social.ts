import api from '.';

const getPinterestSearch = ({ keyword }: { keyword: string }) => {
    return api.get(`/products/pinterest-search/?keyword=${keyword}`);
};

const getPinterestSuggestions = ({ keyword }: { keyword: string }) => {
    return api.get(`/products/pinterest-suggestions/?keyword=${keyword}`);
};

const getTiktokSearch = ({ keyword }: { keyword: string }) => {
    return api.get(`/products/videos-search/?keyword=${keyword}`);
};

export { getPinterestSearch, getPinterestSuggestions, getTiktokSearch };
