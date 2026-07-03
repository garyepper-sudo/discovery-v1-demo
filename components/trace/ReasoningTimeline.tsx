"use client";

type TimelineNode = {
  id: string;
  type: string;
  label: string;
  description?: string;
  confidence?: number;
};

type Props = {
  executive?: TimelineNode | null;
  beliefs?: TimelineNode[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
};

export default function ReasoningTimeline({
  executive,
  beliefs = [],
  activeId,
  onSelect,
}: Props) {
  return (
    <section className="reasoning-timeline">
      <div className="timeline-title">
        Why does Discovery believe this?
      </div>

      <div className="timeline">

        {beliefs.map((belief, index) => (
          <div key={belief.id} className="timeline-row">

            <div className="timeline-left">

              <div className="timeline-line" />

              <button
                className={`timeline-node ${
                  activeId === belief.id ? "active" : ""
                }`}
                onClick={() => onSelect?.(belief.id)}
              >
                <div className="timeline-step">
                  {index + 1}
                </div>

                <div className="timeline-content">

                  <div className="timeline-caption">
                    {index === 0
                      ? "Discovery first noticed..."
                      : index === beliefs.length - 1
                      ? "This ultimately supported..."
                      : "This strengthened the understanding..."}
                  </div>

                  <h3>{belief.label}</h3>

                  {belief.description && (
                    <p>{belief.description}</p>
                  )}

                </div>

              </button>

            </div>

          </div>
        ))}

        <div className="timeline-final">

          <div className="timeline-line final" />

          <div className="timeline-result">

            <div className="timeline-caption">
              Therefore Discovery concluded...
            </div>

            <h2>{executive?.label}</h2>

            {executive?.description && (
              <p>{executive.description}</p>
            )}

          </div>

        </div>

      </div>

      <style jsx>{`

        .reasoning-timeline{
          display:flex;
          flex-direction:column;
          gap:26px;
        }

        .timeline-title{
          font-size:11px;
          text-transform:uppercase;
          letter-spacing:.16em;
          color:#d6b870;
        }

        .timeline{
          display:flex;
          flex-direction:column;
          gap:18px;
        }

        .timeline-left{
          display:flex;
          flex-direction:column;
          gap:0;
        }

        .timeline-line{
          width:2px;
          height:34px;
          margin-left:26px;
          background:
            linear-gradient(
              to bottom,
              rgba(214,184,112,.6),
              rgba(214,184,112,.1)
            );
        }

        .timeline-line.final{
          height:42px;
        }

        .timeline-node{
          display:flex;
          gap:22px;
          align-items:flex-start;

          padding:20px;

          border-radius:22px;

          background:rgba(255,255,255,.03);

          border:1px solid rgba(255,255,255,.06);

          cursor:pointer;

          transition:.25s;
        }

        .timeline-node:hover{
          transform:translateX(6px);

          border-color:
            rgba(214,184,112,.35);
        }

        .timeline-node.active{

          background:
            rgba(214,184,112,.07);

          border-color:
            rgba(214,184,112,.45);
        }

        .timeline-step{

          width:52px;
          height:52px;

          border-radius:999px;

          display:flex;
          align-items:center;
          justify-content:center;

          font-weight:600;

          color:white;

          background:
            radial-gradient(circle,
            rgba(227,194,115,.95),
            rgba(151,118,47,.45));

          box-shadow:
            0 0 26px rgba(214,184,112,.30);

          flex-shrink:0;
        }

        .timeline-caption{

          color:#d6b870;

          font-size:11px;

          text-transform:uppercase;

          letter-spacing:.15em;

          margin-bottom:8px;
        }

        .timeline-content h3{

          margin:0;

          font-size:28px;

          line-height:1.05;

          font-weight:500;
        }

        .timeline-content p{

          margin-top:14px;

          color:rgba(255,255,255,.62);

          line-height:1.7;
        }

        .timeline-result{

          padding:30px;

          border-radius:28px;

          background:
            linear-gradient(
              180deg,
              rgba(214,184,112,.06),
              rgba(255,255,255,.03)
            );

          border:
            1px solid rgba(214,184,112,.18);
        }

        .timeline-result h2{

          margin:8px 0;

          font-size:42px;

          line-height:1;

          font-weight:500;
        }

        .timeline-result p{

          color:rgba(255,255,255,.65);

          line-height:1.7;
        }

      `}</style>

    </section>
  );
}