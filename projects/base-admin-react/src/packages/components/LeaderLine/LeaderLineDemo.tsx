import React, {useEffect, useMemo, useRef, useState} from "react";
import {Card} from "antd";
import LeaderLine from 'leader-line-new';
import {createEffects} from "@peryl/utils/createEffects";
import {addWindowListener} from "@peryl/utils/addWindowListener";
import {removeUnit} from "@peryl/utils/removeUnit";
import {useStrictMounted} from "../../uses/useStrictMounted";

export default () => {

  const [effects] = useState(() => createEffects().effects);
  const startRef = useRef(null as null | HTMLDivElement);
  const endRef = useRef(null as null | HTMLDivElement);
  const leaderLineRef = useRef(null as null | LeaderLine);

  useStrictMounted(async () => {
    leaderLineRef.current = new LeaderLine({
      start: startRef.current!,
      end: endRef.current!,
      endPlug: 'arrow2',
      endPlugColor: '#e3e3e3',
      color: '#e3e3e3',
      size: 2,
      endPlugSize: 2,
    });
    effects.push(() => {leaderLineRef.current?.remove();});
  });

  useEffect(() => {return () => {effects.clear();};}, [effects]);

  const onDraggierMousedown = useElementDraggier({
    onMoving: () => {
      leaderLineRef.current?.position();
    },
  });

  return (
    <div style={{ padding: '1em' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div ref={startRef} style={{ height: '300px', width: '100px', backgroundColor: '#152434' }}/>
          <div ref={endRef} style={{ height: '200px', width: '100px', backgroundColor: '#d6e2a6' }} onMouseDown={onDraggierMousedown}/>
        </div>
      </Card>
    </div>
  );

}

export function useElementDraggier(config?: { onMoving?: () => void }) {
  return useMemo(() => {

      const { effects: draggierEffects } = createEffects();

      const mousedown = (e: React.MouseEvent) => {
        let el = e.target as HTMLElement;
        el.style.position = 'relative';
        let startX = e.clientX;
        let startY = e.clientY;
        let left = Number(removeUnit(el.style.left));
        let top = Number(removeUnit(el.style.top));
        draggierEffects.push(addWindowListener("mousemove", (e) => {
          let moveX = e.clientX;
          let moveY = e.clientY;
          el.style.left = `${left + moveX - startX}px`;
          el.style.top = `${top + moveY - startY}px`;
          config?.onMoving?.();
        }));
        draggierEffects.push(addWindowListener("mouseup", draggierEffects.clear));
      };
      return mousedown;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);
}
