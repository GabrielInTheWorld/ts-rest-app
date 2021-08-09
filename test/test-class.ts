import { Injectable } from './example';
import { OnInit } from './example/interfaces/oninit';

export abstract class TestInterface {}

@Injectable(TestInterface)
export class TestClass implements OnInit {
  public constructor() {
    console.log('TestClass');
  }

  public onInit(): void {
    console.log('onInit was called');
  }
}
