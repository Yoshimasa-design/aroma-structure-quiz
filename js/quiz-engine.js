import { shuffle } from "./common.js";

/**
 * 出題キューを作成する
 * @param {Array} compounds 化合物一覧
 * @param {number} count 出題数
 * @returns {Array}
 */
export function makeQueue(compounds, count = 10) {
  return shuffle(compounds).slice(0, count);
}

export function distract(all, a) {
  const same = shuffle(
    all.filter(c => c.id !== a.id && c.class_group === a.class_group)
  ).slice(0, 2);

  const other = shuffle(
    all.filter(c => c.id !== a.id && !same.some(x => x.id === c.id))
  ).slice(0, 3 - same.length);

  return shuffle([a, ...same, ...other]);
}
