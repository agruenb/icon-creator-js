module.exports = {
    preset: 'jest-playwright-preset',
    testEnvironment: 'jest-playwright-preset',
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFilesAfterEnv: ['expect-playwright'],
};
