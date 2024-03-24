import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: Storage) {
    this.init()
  }

  // Initializing the storage dependency
  private async init(){
    await this.storage.create();
  }

  // Store method
  public async store(key: string, value: any){
    return await this.storage.set(key, value);
  }

  // Retrieve method
  public async get(key: string){
    const value = await this.storage.get(key);
    return value;
  }

  // Remove method
  public async remove(key: string){
    return await this.storage.remove(key);
  }

  // Clear method
  public async clear(){
    return await this.storage.clear();
  }
}
