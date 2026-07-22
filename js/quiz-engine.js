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
