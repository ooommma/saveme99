import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CardService {
  constructor() {}

  // async moveCard(moveCardId: number, betweenCards: number[]) {
  //   //일단 betweenCards의 length가 2개일 경우의 로직
  //   const findCard = await this.cardRepository.findOneBy({ cardId: moveCardId });
  //   if (!findCard) {
  //     throw new NotFoundException('해당 카드를 찾을 수 없습니다.');
  //   }
  //   const betCardsPos = await Promise.all(
  //     betweenCards.map(async (cardId) => {
  //       const card = await this.cardRepository.findOneBy({ cardId });
  //       return card;
  //     }),
  //   ); // pos 순서값
  //   const cardToMovePos = (betCardsPos[0].pos + betCardsPos[1].pos) / 2;

  //   if (cardToMovePos <= 0.0625) {
  //     const allCards = await this.getAllCards(findCard.columnId);
  //     let newPos = 65536;
  //     for (const card of allCards.slice(1)) {
  //       await this.cardRepository.update(card.cardId, { pos: newPos });
  //       newPos *= 1.1;
  //     }
  //   }

  //   const cardToMoveDao = { cardId: moveCardId, pos: cardToMovePos };

  //   const movedCard = await this.cardRepository.update(findCard.cardId, {
  //     pos: cardToMovePos,
  //   });

  //   //만약 betweenCards의 length가 1이라면
  //   //일단 1인 경우는 처음 아니면 마지막 밖에 없기 때문에 일단 검색
  //   const allCards = await this.getAllCards(findCard.columnId);
  //   orderby: pos;
  //   //만약 모든 카드들 중 첫번째와 betweenCards의 아이디 값이 같다면
  //   if (allCards[0].cardId === betweenCards[0]) {
  //     //모든 카드들 중 첫번째 카드의 값이 0.0625 이하이고, 카드 ID가 일치하지 않는다면
  //     if (allCards[0].pos <= 0.0625 && findCard.cardId !== allCards[0].cardId) {
  //       findCard.pos = 8192; // 이동하려는 카드의 pos 초기화
  //       allCards[0].pos = allCards[1].pos / 2;
  //       //그래도 아직 0.0625보다는 큰 경우
  //     } else if (allCards[0].pos > 0.0625 && findCard.cardId !== allCards[0].cardId) {
  //       let curPos = allCards[0].pos;
  //       allCards[0].pos = allCards[1].pos / 2;
  //       findCard.pos = curPos / 2; // 이동하려는 카드의 pos 조정
  //     }
  //     //만약 모든 카드들 중 마지막과 betweenCards의 아이디 값이 같다면
  //   } else if (allCards[allCards.length - 1].cardId === betweenCards[0]) {
  //     findCard.pos = allCards[allCards.length - 1].pos * 1.1;
  //   }
  // }
}
