import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import jsBeautify from 'js-beautify';
import yaml from 'js-yaml';

// Destructure beautifier
const { html: beautifyHtml } = jsBeautify;

// ---------- PATHS ----------

const templatePath = path.join('templates', 'index.template.html');
const bioPath = path.join('content', 'bio.md');
const eventsPath = path.join('content', 'events.yaml');
const outputPath = 'index.html';

// ---------- LOAD TEMPLATE ----------

let template = fs.readFileSync(templatePath, 'utf-8');

// ---------- BIO MARKDOWN ----------

const bioMarkdown = fs.readFileSync(bioPath, 'utf-8');
const bioHtml = marked.parse(bioMarkdown);

let finalHtml = template.replace(
  '<!-- {{BIO_MARKDOWN}} -->',
  bioHtml
);

// ---------- EVENTS YAML ----------

const today = new Date();
today.setHours(0, 0, 0, 0); // midnight compare

let eventsHtml = '';

if (fs.existsSync(eventsPath)) {

  const raw = fs.readFileSync(eventsPath, 'utf-8');
  const data = yaml.load(raw);

  let events = data?.events || [];

  // Filter past events (date only)
  events = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today;
  });

  // Sort by date only
  events.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  if (events.length === 0) {

    eventsHtml = `
      <div class="no-events fade-in-appear">
        No upcoming events — check back soon.
      </div>
    `;

  } else {

    eventsHtml = events.map((event, index) => {

      const dateObj = new Date(event.date);

      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const timeText = event.time
        ? ` · ${event.time}`
        : '';

      const ticketButton = event.tickets
        ? `
          <a href="${event.tickets}"
             target="_blank"
             rel="noopener"
             class="btn btn-secondary event-btn">
            Info
          </a>
        `
        : `<button class="btn btn-secondary event-btn deactivated" disabled>No Info</button>`;

      const featuredClass = index === 0 ? 'featured-event' : '';
      const delay = (index * 0.15).toFixed(2);

      return `
        <div class="event-card fade-in-appear ${featuredClass}"
             style="animation-delay: ${delay}s">

          <div class="event-info">
            <div class="event-date">
              ${formattedDate}${timeText}
            </div>

            <div class="event-location">
              ${event.location}
            </div>
          </div>

          ${ticketButton}

        </div>
      `;

    }).join('\n');

  }

}

// ---------- INJECT EVENTS ----------

finalHtml = finalHtml.replace(
  '<!-- {{EVENTS_SECTION}} -->',
  eventsHtml
);

// ---------- BEAUTIFY OUTPUT ----------

finalHtml = beautifyHtml(finalHtml, {
  indent_size: 2,
  preserve_newlines: true,
  max_preserve_newlines: 2
});

// ---------- WRITE FILE ----------

fs.writeFileSync(outputPath, finalHtml);

console.log('✅ index.html generated successfully!');
