import index from './index';

test('normal', () => {
  expect(index()).toEqual('@umijs/babel-preset-umi');
});
