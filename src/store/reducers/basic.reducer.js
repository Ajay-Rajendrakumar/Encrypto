import * as types from '../actions/types';

const initialState = {
    user_data:{}
};

const Reducer = (state = initialState, action) => {
   
    switch (action.type) {
        case types.USER_DATA: {
            return { ...state, user_data: action.payload };
        }

        default: {
            return state;
        }
    }
};

export default Reducer;
