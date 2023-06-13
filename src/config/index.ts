interface IConfig {
    DOLPHIN_BEARER: string;
    SHEET_ID: string;
    DELAYS: number[];
    GAS_AMOUNT: number;
    CHECK_AMOUNT_OF_AVAILABLE_MESSAGE: boolean;
    SITES: {
        ATTICC: {
            MAKE_POST: boolean;
            COLLECT_GIFT: boolean;
        };
        CYBERTUNE: {
            MAKE_POST: boolean;
            LEAVE_LIKE: boolean;
            LEAVE_COMMENT: boolean;
            FOLLOW_ARTIST: boolean;
            SUBSCRIBE_ARTIST: boolean;
        }
    };
}

const config: IConfig = {
    DOLPHIN_BEARER: `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYTI4NDM0ODIwZDkwMTFjMGIxYTA2NWY1NTQ3ZGVmNDg0NDFmZjkyNzM2MWZhMGZhMjA2YmM3ZGJmZDhiMzg1MWRlMjQxZThlMDk5ZTA1YjkiLCJpYXQiOjE2ODYzMDY0OTguNDM2OTY2LCJuYmYiOjE2ODYzMDY0OTguNDM2OTY4LCJleHAiOjE2ODg4OTg0OTguNDI3NTQ4LCJzdWIiOiIyNDQzODE3Iiwic2NvcGVzIjpbXX0.qfIYsqApqb7o202ZQiL8jQ6q-_rsMHgeLjeH3Cbn7X-L73-sZbE7T__1AEvMwSPm9S58Q3QevgIEpsQKrezULGUHi7jjEaSPh1KGouIr7pBGpfBMj8Ps4pnju5CTyqL7sXATzPRnqsbjsTX7u7aXz7V2MBXRZOL-qQp3YW9vZuSXfBQEAsLzcYOgzKBtn6oQYISvz8LIwS5VQcOkCDsp1GtezwPFHjn-owkXXdn6UX7Z7Hg6Ufu01GhFmi3kUOTvRGi6kWHtREpGzRFbcW4liKSUbOWQ22nxA3PrRc0Lp4umF5EDmemMySJnGe5l0uyrk_QgjUG3bbJff6lfSXBik42ZHTXxKS_8Gt27bPjY717POsaumqUhbO4u-DL_lmWh1xnIL9fdmmuNgqf-dzZsTvP_HbPc5M5ZO3vc0fSwHOpPpMXdnPa6Y8EaEVTUVRn_TDmnqdBFm-kw77tBjXA1eeBHZksaXWKjo34cp1W8bN4vLVFmpUMz77zPSQGJ-1-6qePlxKQIONvVWL7-IXF90R-iSaCnqNyPRrNMcZijDy54ApLTXOsoDSaPUzunvMavAly1bE78o0abWkh9-mVKAtklo_ODfaLM3Mi6S-X7W-jiV8fESmj6j51DBV94vxDxwJk-fmclVc_OTAgDpSzU4pjkkLjUmSeA0LPLgBp_K7A`,
    SHEET_ID: "1NCvQhTMhgbpIXdsUVQkT6oQJNzw4fHUA3DF0p-hdn5U",
    DELAYS: [ 3000 ],
    GAS_AMOUNT: 1,
    CHECK_AMOUNT_OF_AVAILABLE_MESSAGE: false,
    SITES: {
        ATTICC: {
            MAKE_POST: false,
            COLLECT_GIFT: true
        },
        CYBERTUNE: {
            MAKE_POST: false,
            LEAVE_LIKE: true,
            LEAVE_COMMENT: true,
            FOLLOW_ARTIST: true,
            SUBSCRIBE_ARTIST: true
        }
    }
};

export default config;