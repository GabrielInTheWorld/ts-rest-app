import { Inject, Injectable } from 'final-di';

interface OnInit {
  onInit(): void;
}

export abstract class TestInterface {}

export class TestClass2 {
  world = 'world';
}

@Injectable(TestInterface)
export class TestClass implements OnInit {
  @Inject(TestClass2)
  private readonly class2: TestClass2;

  public constructor() {
    console.log('TestClass', this.class2?.world);
  }

  public onInit(): void {
    console.log('onInit was called');
  }
}
