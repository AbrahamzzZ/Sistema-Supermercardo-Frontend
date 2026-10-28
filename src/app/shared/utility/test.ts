import { Provider, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

export async function createPageFixture<T>(
  component: Type<T>,
  providers: Provider[] = []
): Promise<ComponentFixture<T>> {
  await TestBed.configureTestingModule({
    imports: [component],
    providers
  })
    .overrideComponent(component, { set: { template: '', imports: [] } })
    .compileComponents();

  return TestBed.createComponent(component);
}
