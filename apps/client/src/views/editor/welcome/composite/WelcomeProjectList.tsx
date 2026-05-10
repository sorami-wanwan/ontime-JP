import { useOrderedProjectList } from '../../../../common/hooks-query/useProjectList';
import { useTranslation } from '../../../../translation/useTranslation';

import style from '../Welcome.module.scss';

interface WelcomeProjectListProps {
  loadProject: (filename: string) => Promise<void>;
  onClose: () => void;
}

export default function WelcomeProjectList(props: WelcomeProjectListProps) {
  const { getLocalizedString } = useTranslation();
  const { loadProject, onClose } = props;
  const { data } = useOrderedProjectList();

  return (
    <tbody>
      {data.reorderedProjectFiles.map((project) => {
        if (project.filename === data.lastLoadedProject) {
          return (
            <tr className={style.current} key={project.filename} onClick={onClose}>
              <td>{project.filename}</td>
              <td>{getLocalizedString('welcome.loaded_last')}</td>
            </tr>
          );
        }
        return (
          <tr key={project.filename} onClick={() => loadProject(project.filename)}>
            <td>{project.filename}</td>
            <td>{new Date(project.updatedAt).toLocaleString()}</td>
          </tr>
        );
      })}
    </tbody>
  );
}
