import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from '../srcsss/app.config';
import { AppComponent } from '../srcsss/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
