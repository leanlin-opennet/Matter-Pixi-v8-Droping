import { ExtensionType, type Container, type System, extensions } from 'pixi.js';

export interface RecordData {
  id: string;
  label: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export class PathGeneratorSystem implements System {
  public static extension = {
    type: [ExtensionType.WebGLSystem, ExtensionType.WebGPUSystem],
    name: 'pathGenerator',
  } as const;

  isRecording = false;

  recordingEntities: Container[] = [];
  currentRecordData: Partial<RecordData>[][] = [];

  init() {}

  public update(_: Container) {
    if (!this.isRecording) {
      return;
    }
    const changes: Partial<RecordData>[] = [];
    this.currentRecordData.push(changes);
    for (const entity of this.recordingEntities) {
      const beforeData = entity._beforeData;
      if (!beforeData || entity.destroyed) {
        continue;
      }

      const changeMap = {
        x: entity.x !== beforeData.x,
        y: entity.y !== beforeData.y,
        rotation: entity.rotation !== beforeData.rotation,
        scaleX: entity.scale.x !== beforeData.scaleX,
        scaleY: entity.scale.y !== beforeData.scaleY,
      };

      const hasChanged = Object.values(changeMap).some(Boolean);

      if (!hasChanged) {
        continue;
      }

      const data: Partial<RecordData> = {
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
        data.rotation = entity.rotation;
        beforeData.rotation = entity.rotation;
      }
      if (changeMap.scaleX) {
        data.scaleX = entity.scale.x;
        beforeData.scaleX = entity.scale.x;
      }
      if (changeMap.scaleY) {
        data.scaleY = entity.scale.y;
        beforeData.scaleY = entity.scale.y;
      }

      changes.push(data);
    }
  }

  public prerender({ container }: { container: Container }) {
    this.update(container);
  }

  public startRecording(entieies: Container[]) {
    this.recordingEntities = entieies;
    this.isRecording = true;
    const initialData: RecordData[] = [];

    let id = 0;
    for (const entity of this.recordingEntities) {
      const _id = id++;
      entity._beforeData = {
        id: _id.toString(),
        x: entity.position.x,
        y: entity.position.y,
        rotation: entity.rotation,
        scaleX: entity.scale.x,
        scaleY: entity.scale.y,
      };

      initialData.push({
        id: _id.toString(),
        label: entity.label,
        x: entity.position.x,
        y: entity.position.y,
        rotation: entity.rotation,
        scaleX: entity.scale.x,
        scaleY: entity.scale.y,
      });
    }
    this.currentRecordData.push(initialData);
  }

  public stopRecording() {
    this.isRecording = false;
    return this.currentRecordData;
  }
}

extensions.add(PathGeneratorSystem);
