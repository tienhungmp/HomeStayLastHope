import {
    transformDateStringIsoToLocale,
    transformDateStringLocaleToIso
} from "../../../backend/utils/date.utils";

describe('Test date.utils', () => {
    test('Transform 2024-09-15 to 15/09/2024', () => {
        expect(transformDateStringIsoToLocale('2024-09-15')).toBe('15/09/2024');
    });

    test('Transform 15/09/2024 to 2024-09-15', () => {
        expect(transformDateStringLocaleToIso('15/09/2024')).toBe('2024-09-15');
    });

    test("Should return string that can't be convert", () => {
        expect(transformDateStringIsoToLocale('dummy-string')).toBe('dummy-string');
        expect(transformDateStringLocaleToIso('dummy-string')).toBe('dummy-string');
    });
});