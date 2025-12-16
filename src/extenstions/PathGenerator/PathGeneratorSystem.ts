import { ExtensionType, type Container, type System, extensions } from 'pixi.js';

import type { Character } from '../../components/Character';
import { Coin } from '../../components/Coin';

export interface EntityStateData {
  id: string;
  label: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;

  variant?: number;
  collected?: boolean;
  flipped?: boolean;
}

export interface RecordData {
  entities: Partial<EntityStateData>[];
  score: number;
}

export class PathGeneratorSystem implements System {
  public static extension = {
    type: [ExtensionType.WebGLSystem, ExtensionType.WebGPUSystem],
    name: 'pathGenerator',
  } as const;

  isRecording = false;

  currentCharacter?: Character;
  recordingEntities: Container[] = [];
  currentRecordData: RecordData[] = [];

  init() {}

  public update(_: Container) {
    if (!this.isRecording) {
      return;
    }
    const changes: Partial<EntityStateData>[] = [];
    this.currentRecordData.push({
      entities: changes,
      score: this.currentCharacter?.score || 0,
    });
    for (const entity of this.recordingEntities) {
      const beforeData = entity._beforeData;
      if (!beforeData || entity.destroyed) {
        continue;
      }

      const rotation =
        entity.label === 'character' ? (entity as Character).characterRotation : entity.rotation;

      const changeMap = {
        x: entity.x !== beforeData.x,
        y: entity.y !== beforeData.y,
        rotation: rotation !== beforeData.rotation,
        scaleX: entity.scale.x !== beforeData.scaleX,
        scaleY: entity.scale.y !== beforeData.scaleY,

        collected: Boolean((entity as Coin).isCollected) !== beforeData.collected,
        flipCount: (entity as Character)._flipCount !== beforeData.flipCount,
      };

      const hasChanged = Object.values(changeMap).some(Boolean);

      if (!hasChanged) {
        continue;
      }

      const data: Partial<EntityStateData> = {
        id: beforeData.id,
        label: entity.label,
      };
      if (changeMap.x) {
        data.x = entity.x;
        beforeData.x = entity.x;
      }
      if (changeMap.y) {
        data.y = entity.y;
        beforeData.y = entity.y;
      }
      if (changeMap.rotation) {
        data.rotation = rotation;
        beforeData.rotation = rotation;
      }
      if (changeMap.scaleX) {
        data.scaleX = entity.scale.x;
        beforeData.scaleX = entity.scale.x;
      }
      if (changeMap.scaleY) {
        data.scaleY = entity.scale.y;
        beforeData.scaleY = entity.scale.y;
      }
      if (changeMap.collected) {
        data.collected = (entity as Coin).isCollected;
        beforeData.collected = data.collected;
      }
      if (changeMap.flipCount) {
        data.flipped = true;
        beforeData.flipCount = (entity as Character)._flipCount;
      }

      changes.push(data);
    }
  }

  public prerender({ container }: { container: Container }) {
    this.update(container);
  }

  public startRecording(entieies: Container[], character: Character) {
    this.currentCharacter = character;
    this.recordingEntities = entieies;
    this.currentRecordData = [];
    this.isRecording = true;
    const initialData: Partial<EntityStateData>[] = [];

    let id = 0;
    for (const entity of this.recordingEntities) {
      const _id = id++;
      const rotation =
        entity.label === 'character' ? (entity as Character).characterRotation : entity.rotation;
      entity._beforeData = {
        id: _id.toString(),
        x: entity.position.x,
        y: entity.position.y,
        rotation: rotation,
        scaleX: entity.scale.x,
        scaleY: entity.scale.y,
        collected: false,
      };

      initialData.push({
        id: _id.toString(),
        label: entity.label,
        x: entity.position.x,
        y: entity.position.y,
        rotation: rotation,
        scaleX: entity.scale.x,
        scaleY: entity.scale.y,
        collected: false,
        variant: entity instanceof Coin ? (entity as Coin).id : undefined,
      });
    }
    this.currentRecordData.push({
      entities: initialData,
      score: 0,
    });
  }

  public stopRecording() {
    this.isRecording = false;
    return this.currentRecordData;
  }
}

extensions.add(PathGeneratorSystem);
